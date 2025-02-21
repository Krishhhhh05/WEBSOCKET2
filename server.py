import asyncio
import websockets
import json

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
            data = json.loads(message)
            print(f"Received: {data}")

            if data["action"] == "add_card":
                await handle_add_card(data["card"])
            if data["action"] == "toggle_player":
                await toggle_player(data["player"])
            elif data["action"] == "reset_game":
                await handle_reset_game()


    except websockets.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    finally:
        connected_clients.remove(websocket)

async def handle_add_card(card):
    """Handles adding a card to the game."""
    global game_state

    if game_state["joker"] is None:
        game_state["joker"] = card  # First card is Joker
        update = {"action": "set_joker", "joker": card}
        await broadcast(update)
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
        await broadcast(update)
        winner = check_win_condition()
        if winner is not None:
            update["action"] = "game_won"
            update["winner"] = winner  # 0 for Andar, 1 for Bahar

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



async def broadcast(message):
    """Sends a message to all connected clients."""
    if connected_clients:
        await asyncio.gather(
            *[client.send(json.dumps(message)) for client in connected_clients]
        )

async def main():
    """Starts the WebSocket server."""
    async with websockets.serve(handle_connection, "localhost", 6789):
        print("WebSocket server running on ws://localhost:6789")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
