import asyncio
import websockets
import json
import motor.motor_asyncio
from datetime import datetime


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
            print(f"Raw message received: {message}")  # <-- Debugging print
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
            elif data["action"] == "key_pressed":
                print(f"Key pressed received: {data['key']}")  # <-- Debugging print
                if data["key"] == "A":
                    await handle_add_card("QH")


    except websockets.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    finally:
        connected_clients.remove(websocket)

async def handle_add_card(card):
    print(card)
    """Handles adding a card to the game."""
    global game_state

    if game_state["joker"] is None:
        game_state["joker"] = card  # First card is Joker
        update = {"action": "set_joker", "joker": card}
        asyncio.create_task(broadcast(update))  # <-- Fire and forget

    else:
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
        print(update)
        
        asyncio.create_task(broadcast(update))  # <-- Fire and forget

        winner = check_win_condition()
        
        if winner is not None:
            winner_section = "andar" if winner == 0 else "bahar"
            update["action"] = "update_game"
           
            update["winner"] = winner_section  # Store section name

            # Store win in MongoDB
            await record_win(winner)
            print(winner)

            # asyncio.create_task(broadcast(update))  # <-- Fire and forget


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

async def record_win(winner_section):
    """Stores the game win in MongoDB."""
    win_record = {
        "winner": winner_section,
        "timestamp": datetime.utcnow(),
    }
    await wins_collection.insert_one(win_record)
    print(f"Recorded win: {win_record}")

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

async def read_from_serial():
    while True:
        # start_time = time.time()  # Start the timer

        if ser.in_waiting > 0:
            raw_data = ser.readline().decode("utf-8").strip()

            # start_time = time.time()
            match = re.search(r"<Card:(.*?)>", raw_data)
            card= match.group(1) if match else None
            # end_time = time.time() 
            # print(f"regex took { end_time - start_time:.4f} seconds")
            print("card:", card)
            if card:
                # start_time = time.time()
                asyncio.create_task(handle_add_card(card))
                # end_time = time.time() 
                # print(f"asynchio iteration took { end_time - start_time:.4f} seconds")


        # end_time = time.time()  
        # print(f"Loop iteration took { end_time - start_time:.4f} seconds")

        await asyncio.sleep(0.1)  

async def main():
    print("Connected to:", ser.name)
    """Starts the WebSocket server and serial reader."""
    server = websockets.serve(handle_connection, "0.0.0.0", 6789)
    print("WebSocket server running on ws://169.254.192.244:6789")

    await asyncio.gather(server, read_from_serial())  # Run both tasks concurrently


if __name__ == "__main__":
    asyncio.run(main())


