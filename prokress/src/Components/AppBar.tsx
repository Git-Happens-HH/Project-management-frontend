function AppBar() {
  return(
    <div class="w-screen h-22 flex justify-between items-center bg-white px-4">
      <div id="logo-box" class="flex items-center space-x-4 text-black">
        <h1 class="text-5xl">Prokress</h1>
      </div>
      <div id="button-row" class="flex space-x-4">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-10 h-10">S</button>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-10 h-10">P</button>
      </div>
    </div>
  )
}
export default AppBar
