import asyncio
import websockets
import json
import motor.motor_asyncio
from datetime import datetime
import random
import asyncio

import serial
import time
import urllib.parse
import re
ser = serial.Serial("COM1", 9600, timeout=0.1)  # Adjust baud rate if necessary

# MongoDB setup
MONGO_URI = "mongodb://localhost:27017"  # Change this if needed
DB_NAME = "game_db"
COLLECTION_NAME = "game_wins"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
wins_collection = db[COLLECTION_NAME]

connected_clients = set()

# Global game state
game_state = {
    "joker": None,
    "andar": [],
    "bahar": [],
    "next_section": "bahar",  # First card goes to Bahar, then alternate
}

    
async def handle_connection(websocket):
    global game_paused
    """Handles new player connections."""
    connected_clients.add(websocket)
    print(f"Client connected: {websocket.remote_address}")

    # Send current game state to new client
    await websocket.send(json.dumps({
        "action": "update_game",
        "joker": game_state["joker"],
        "andar": game_state["andar"],
        "bahar": game_state["bahar"],
    }))

    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")

            

            if data["action"] == "add_card":
                await handle_add_card(data["card"])
            if data["action"] == "toggle_player":
                await toggle_player(data["player"])
            elif data["action"] == "reset_game":
                await handle_reset_game()
            elif data["action"] == "bet_changed":
                await handle_change_bet(data["minBet"],data["maxBet"])
            elif data["action"] == "undo_card":
                await undo_card()
            elif data["action"] =="game_won":
                await record_win(data["winner"])
            elif data["action"] == "delete_win":
                await delete_win()
            elif data["action"] == "delete_all_wins":
                await delete_all_wins()
            elif data["action"] == "start_automatic":
                await start_automatic()
            elif data["action"] == "table_number_set":
                print("table number")
                await handle_table_number(data["tableNumber"])
                
            

            
 
    except websockets.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    finally:
        connected_clients.remove(websocket)

async def handle_add_card(card):
    """Handles adding a card to the game."""
    global game_state

    if game_state["joker"] is None:
        # First card is Joker
        game_state["joker"] = card
        update = {"action": "set_joker", "joker": card}
        await broadcast(update)
    else:
        # Check if card is already present in andar, bahar, or joker
        if (
            card == game_state["joker"] or
            card in game_state["andar"] or
            card in game_state["bahar"]
        ):
            # Broadcast duplicate card action
            await broadcast({"action": "duplicate_card", "card": card})
            print(f"Duplicate card detected: {card}")
            return  # Exit the function without adding the card

        # Assign card to the current section
        section = game_state["next_section"]
        game_state[section].append(card)

        # Alternate between Andar and Bahar
        game_state["next_section"] = "andar" if section == "bahar" else "bahar"

        update = {
            "action": "update_game",
            "joker": game_state["joker"],
            "andar": game_state["andar"],
            "bahar": game_state["bahar"],
        }
        await broadcast(update)

        winner = check_win_condition()
        print("winner in check win", winner)
        if winner is not None:
            # update["action"] = "game_won"
            update["winner"] = winner  # Store section name

            # Store win in MongoDB
            await record_win(winner)
            print("winner in record win", winner)

            await broadcast(update)

async def handle_reset_game():
    """Resets the game state."""
    global game_state
    game_state = {
        "joker": None,
        "andar": [],
        "bahar": [],
        "next_section": "bahar",
    }

    await broadcast({"action": "reset_game"})

async def undo_card():
    """Removes the last card from the previous section."""
    global game_state

    if game_state["next_section"] == "andar":
        
        if game_state["bahar"]:  # Ensure there's a card to remove
            game_state["bahar"].pop()
            game_state["next_section"] = "andar" if game_state["next_section"]  == "bahar" else "bahar"
            print(game_state)
            await broadcast({
            "action": "update_game",
            "joker": game_state["joker"],
            "andar": game_state["andar"],
            "bahar": game_state["bahar"],
            "next_section": "andar"
            })

    else:  # next_section is "bahar"
        if game_state["andar"]:  # Ensure there's a card to remove
            game_state["andar"].pop()
            game_state["next_section"] = "andar" if game_state["next_section"]  == "bahar" else "bahar"
            print(game_state)
            await broadcast({
            "action": "update_game",
            "joker": game_state["joker"],
            "andar": game_state["andar"],
            "bahar": game_state["bahar"],
            "next_section": "bahar"
            })

# Deck setup
ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
suits = ["S", "D", "C", "H"]
deck = [rank + suit for rank in ranks for suit in suits]
random.shuffle(deck)

# Track the number of times the "Next" button is clicked
click_count = 0

async def start_automatic():
    """Automatically plays the game with pauses after Joker and two initial cards."""
    global click_count
    
    ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
    suits = ["S", "D", "C", "H"]
    deck = [rank + suit for rank in ranks for suit in suits]
    random.shuffle(deck )

    # Step 1: Draw the Joker and PAUSE
    if click_count == 0:
        joker = deck.pop(0)
        await handle_add_card(joker)  # Joker card
        print(f"Joker revealed: {joker}")
        click_count += 1
        

    # Step 2: Draw the first two cards and PAUSE
    elif click_count == 1:
        print("first 2 card")

        first_card = deck.pop(0)
        await handle_add_card(first_card)
        await asyncio.sleep(1.5)
        
        second_card = deck.pop(0)

        await handle_add_card(second_card)

        print(f"First two cards revealed: {first_card}, {second_card}")
        click_count += 1
        # return  

    # Step 3: Continue automatic play until a winner is found
    elif click_count == 2:
        print("Starting automatic play...")
        for card in deck:
            await handle_add_card(card)  # Play one card

            # Stop if there's a winner
            winner = check_win_condition()
           

            if winner is not None:
                print(f"Winner identified: {winner}")
                break  # Stop playing once there's a winner

            await asyncio.sleep(2.5)  # Real-time effect with 2 seconds interval

        click_count = 0
        print("resetting click count")


players = {
    "player1": False,
    "player2": False,
    "player3": False,
    "player4": False,
    "player5": False,
    "player6": False,
}

async def toggle_player(player):
    """Toggles player visibility and broadcasts update."""
    players[player] = not players[player]
    update = {
            "action": "update_players",
            "players": players
        }

    await broadcast(update)

def extract_card_number(card):
    """Extracts the number from a card like '4S' -> '4'."""
    return card[:-1]  # Removes suit (e.g., '4S' -> '4')

def check_win_condition():
    """Checks if any card matches the joker and determines the winner."""
    if game_state["joker"] is None:
        return None

    joker_number = extract_card_number(game_state["joker"])

    for card in game_state["andar"]:
        if extract_card_number(card) == joker_number:
            return 0  # Andar wins

    for card in game_state["bahar"]:
        if extract_card_number(card) == joker_number:
            return 1  # Bahar wins

    return None    

async def delete_win():
    """Deletes the most recent game win from MongoDB."""
    last_win = await wins_collection.find_one(sort=[("timestamp", -1)])
    if last_win:
        result = await wins_collection.delete_one({"_id": last_win["_id"]})
        if result.deleted_count > 0:
            print(f"Deleted last win: {last_win}")
            update = {"action": "delete_win"}
            await broadcast(update)
        else:
            print("Failed to delete the last win.")
    else:
        print("No win records found to delete.")
    


async def delete_all_wins():
    """Deletes all game wins from MongoDB."""
    result = await wins_collection.delete_many({})
    if result.deleted_count > 0:
        print(f"Deleted all wins: {result.deleted_count} records")
        update = {"action": "delete_all_wins"}
        await broadcast(update)
    else:
        print("No win records found to delete.")    
            

async def record_win(winner):
    """Stores the game win in MongoDB."""
    win_record = {
        "winner": winner,
        "timestamp": datetime.utcnow(),
    }
    await wins_collection.insert_one(win_record)
    print(f"Recorded win: {win_record}")
    update = {"action": "game_won", "winner": winner}
    await broadcast(update)

async def handle_change_bet(minBet,maxBet):
    """changes the bets."""
    print("in function")
    bets = {
        "action": "bets_changed",
        "maxBet": maxBet,
        "minBet": minBet
    }
    
    await broadcast(bets)
    print(f"New bets: {bets}")

async def handle_table_number(table_number):
    """Broadcasts the table number change."""
    print("in function table")
    table_info = {
        "action": "table_number_set",
        "tableNumber": table_number
    }
    
    await broadcast(table_info)
    print(f"New table number: {table_info}")


async def broadcast(message):
    """Sends a message to all connected clients."""
    if connected_clients:
        await asyncio.gather(
            *[client.send(json.dumps(message)) for client in connected_clients]
        )

def extract_card_value(input_string):
    """
    Extract the card value from the input string formatted like:
    [Manual Burn Cards]<Card:{data}>
    """
    match = re.search(r"<Card:(.*?)>", input_string)
    return match.group(1) if match else None

async def read_from_serial():
    """Continuously reads card values from the casino shoe reader and adds them to the game."""
    while True:
        if ser.in_waiting > 0:
            raw_data = ser.readline().decode("utf-8").strip()
            card = extract_card_value(raw_data)
            print ("card:",card)
            if card:
                await handle_add_card(card)
        await asyncio.sleep(0.1)  # Adjust delay if necessary

async def main():
    print("Connected to:", ser.name)
    """Starts the WebSocket server and serial reader."""
    server = websockets.serve(handle_connection, "0.0.0.0", 6789)
    print("WebSocket server running on ws://169.254.192.244:6789")

    await asyncio.gather(server, read_from_serial())  # Run both tasks concurrently


if __name__ == "__main__":
    asyncio.run(main())
# async def main():
#     """Starts the WebSocket server."""
#     async with websockets.serve(handle_connection, "localhost", 6789):
#         print("WebSocket server running on ws://localhost:6789")
#         await asyncio.Future()

# if __name__ == "__main__":
#     asyncio.run(main())