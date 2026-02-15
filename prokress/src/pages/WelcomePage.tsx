function WelcomePage() {
  return(
    <div class="flex flex-col min-h-screen justify-center items-center">
      <h1 class="text-8xl">Get started with Prokress</h1>
      <div class="flex flex-row gap-4 m-10">
        <button class="w-38 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</button>
        <button class="w-38 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign-up</button>
      </div>
    </div>
  )
}
export default WelcomePage
