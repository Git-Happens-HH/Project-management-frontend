import Dialog from "../Components/Dialog.tsx";
import { useState } from "react";

function WelcomePage() {
  const [dialogMode, setDialogMode] = useState<"login" | "register" | null>(null);

  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      <h1 className="text-8xl m-4 md:text-nowrap">Get started with Prokress</h1>
      
      <div className="flex flex-row gap-4 m-10">
        <button 
          className="w-38 bg-orange-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded" 
          onClick={() => setDialogMode("login")}
        >
          Login
        </button>
        
        <button 
          className="w-38 bg-orange-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded" 
          onClick={() => setDialogMode("register")}
        >
          Sign-up
        </button>
      </div>

      {dialogMode && (
        <Dialog 
          isOpen={true} 
          mode={dialogMode} 
          toggleDialog={() => setDialogMode(null)} 
        />
      )}
    </div>
  );
}

export default WelcomePage;