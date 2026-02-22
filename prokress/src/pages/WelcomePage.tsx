import Dialog from "../Components/Dialog.tsx";
import { useState } from "react";

function WelcomePage() {
   const [isClicked, setIsClicked] = useState(false);
   const [isClickedtwo, setIsClickedtwo] = useState(false);
  return(
    <div class="flex flex-col min-h-screen justify-center items-center">
      <h1 class="text-8xl m-4 md:text-nowrap">Get started with Prokress</h1>
      <div class="flex flex-row gap-4 m-10">
        <button class="w-38 bg-(--color-orange) hover:bg-(--color-green) text-white font-bold py-2 px-4 rounded" onClick={() => setIsClicked(true)}>Login</button>
        <button class="w-38 bg-(--color-orange) hover:bg-(--color-green) text-white font-bold py-2 px-4 rounded" onClick={() => setIsClicked(true)}>Sign-up</button>
      </div>
      {
         isClicked && <Dialog />
      }
    </div>
  )
}
export default WelcomePage
