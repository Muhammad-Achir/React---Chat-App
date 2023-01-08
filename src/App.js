import { useEffect, useState } from 'react'
import './App.css';

const ws = new WebSocket("ws://localhost:3000/cable")

function App() {
  const [messages, setMessages] = useState([]);
  const [guid, setGuid] = useState("");
  const messagesContainer = document.getElementById("messages")

  ws.onopen = () => {
    console.log("Connected to websocket server");
    setGuid(Math.random().toString(36).substring(2, 15))

    ws.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          id: guid,
          channel: "MessagesChannel",
        })
      })
    )
  }

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (
      data.type === "ping" ||
      data.type === "welcome" ||
      data.type === "confirm_subscription"
    ) {
      return
    }

    const message = data.message

    setMessagesAndScrollDown([...messages, message])
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    resetScroll()
  }, [messages])

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:3000/messages")
    const data = await response.json()
    setMessagesAndScrollDown(data)
  }

  const setMessagesAndScrollDown = (data) => {
    setMessages(data)
    resetScroll()
  }

  const resetScroll = () => {
    if (!messagesContainer) {
      return
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = e.target.message.value
    e.target.message.value = ""

    await fetch("http://localhost:3000/messages", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ body }),
    })
  }

  return (
    <div className="App">
      <div className='messageHeader'>
        <h1>Messages</h1>
      </div>
      <div className='messages' id="messages">
        {
          messages.map((message) => (
            <div className='message' key={message.id}>
              <p>{message.body}</p>
            </div>
          ))
        }
      </div>
      <div className='messageForm'>
        <form onSubmit={handleSubmit}>
          <input className='messageInput' type="text" name="message" />
          <button className='messageButton' type='submit'>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
