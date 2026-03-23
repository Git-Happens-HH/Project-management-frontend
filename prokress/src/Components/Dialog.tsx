import { useState, type SubmitEvent } from "react";
import { loginHandler, registerHandler } from "../helper/handler";


interface DialogProps {
  isOpen: boolean;
  toggleDialog: () => void;
  mode: "login" | "register"; // New prop to choose the mode
}


const Dialog: React.FC<DialogProps> = ({ isOpen, toggleDialog, mode }) => {
  const [userData, setUserData] = useState(
    {
      userName: '',
      firstName: '',
      lastName: '',
      email: '',
      passwordHash: ''
    }
  ) 
  if (!isOpen) return null;

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    
    if(mode == 'login') {
      loginHandler()
      .then(users => {
      const userlist = users._embedded?.AppUsers ?? [];
      return userlist
        })
        .catch(error => {console.log(error)});
    } else if (mode == 'register') {
     registerHandler(userData)
    }

    toggleDialog();
  };

  const isLogin = mode === "login";

  return (
    <div
      onClick={toggleDialog}  /*Close dialog when clicking outside */
      className="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-opacity-60 backdrop-blur-xs transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}  /* Prevents closing when clicking inside the dialog */
        className="relative mx-auto w-full max-w-[24rem] rounded-lg overflow-hidden shadow-sm bg-white"
      >
        <form onSubmit={handleSubmit} className="relative flex flex-col bg-white">        
          <div className="relative m-2.5 items-center flex justify-center text-white h-24 rounded-md bg-(--prokress-violet)">
            <h3 className="text-2xl font-semibold">
              {isLogin ? "Login" : "Create Account"}
            </h3>
          </div>

          <div className="flex flex-col gap-4 p-6">                     
            {!isLogin && (  /* Only shown when NOT in login mode */
              <div className="w-full max-w-sm min-w-[200px]"> 
                <label className="block mb-2 text-sm text-slate-600 font-medium">First Name</label>
                <input
                  required /* mandatory field */
                  type="text"
                  className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                  onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                />
              </div>
            )}

            {!isLogin && (  /* Only shown when NOT in login mode */
              <div className="w-full max-w-sm min-w-[200px]"> 
                <label className="block mb-2 text-sm text-slate-600 font-medium">Last Name</label>
                <input
                  required /* mandatory field */
                  type="text"
                  className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                  onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                />
              </div>  
            )}

            {!isLogin && (  /* Only shown when NOT in login mode */
              <div className="w-full max-w-sm min-w-[200px]"> 
                <label className="block mb-2 text-sm text-slate-600 font-medium">Username</label>
                <input
                  required /* mandatory field */
                  type="text"
                  className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                  onChange={(e) => setUserData({...userData, userName: e.target.value})}
                />
              </div>  
            )}

            <div className="w-full max-w-sm min-w-[200px]">
              <label className="block mb-2 text-sm text-slate-600 font-medium">Email Address</label>
              <input
                required
                type="email"
                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                onChange={(e) => setUserData({...userData, email: e.target.value})}
              />
            </div>

            <div className="w-full max-w-sm min-w-[200px]">
              <label className="block mb-2 text-sm text-slate-600 font-medium">Password</label>
              <input
                required
                type="password"
                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                onChange={(e) => setUserData({...userData, passwordHash: e.target.value})}
              />
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              type="submit"
              className="w-full rounded-md bg-(--prokress-violet) py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-(--prokress-orange) transition-all"
            >
              {isLogin ? "Login" : "Register"}
            </button>
            
            <p className="flex justify-center mt-6 text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                className="ml-1 font-bold text-slate-800 hover:underline"
              >
                {isLogin ? "Register" : "Login"}
                    {/* Button doesnt do anything yet */}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dialog;
