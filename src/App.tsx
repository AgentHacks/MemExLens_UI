import ChatContainer from "./components/ChatContainer";
import Login from "./components/Login";
import { ChatProvider } from "./context/ChatProvider";
import { useChat } from "./hooks/useChat";
import "./assets/App.css";

const AppContent = () => {
  const { isLoggedIn } = useChat();

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return <div className="loading">Loading...</div>;
  }

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  // Show chat if authenticated
  return (
    <div className="app">
      <ChatContainer />
    </div>
  );
};

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
