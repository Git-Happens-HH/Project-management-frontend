function AppBar() {
  return(
    <div class="w-screen flex justify-between items-center bg-white px-4">
      <div id="logo-box" class="flex items-center space-x-4 text-black">
        <h1>Prokress</h1>
      </div>
      <div id="button-row" class="flex space-x-4">
        <button>Settings</button>
        <button>Profile</button>
      </div>
    </div>
  )
}
export default AppBar
