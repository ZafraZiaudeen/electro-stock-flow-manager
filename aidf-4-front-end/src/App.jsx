import { Button } from "./components/ui/button";
function App() {
  const handleClick = () => {
    console.log('Button clicked');
  };
  
  return (
    <div>
      <h1 className="text-red-500 mx-4 mt-3 text-xl">Zafra.........</h1>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}

export default App;