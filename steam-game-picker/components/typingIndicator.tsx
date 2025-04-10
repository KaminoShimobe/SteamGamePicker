export default function TypingIndicator() {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-blue-500 font-medium">Steam Game Picker is thinking...</p>
      </div>
    );
  }

