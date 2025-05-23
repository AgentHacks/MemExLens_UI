import ChatContainer from "./components/ChatContainer";
import { ChatProvider } from "./context/ChatProvider";
import "./assets/App.css";

function App() {
  return (
    <ChatProvider>
      <div className="app">
        <ChatContainer />
      </div>
    </ChatProvider>
  );
}

export default App;
