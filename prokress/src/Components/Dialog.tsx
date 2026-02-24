import type { SubmitEvent } from "react";


interface DialogProps {
  isOpen: boolean;
  toggleDialog: () => void;
  mode: "login" | "register"; // New prop to choose the mode
}

const Dialog: React.FC<DialogProps> = ({ isOpen, toggleDialog, mode }) => {
  if (!isOpen) return null;

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    console.log(`${mode} form submitted!`);       /* Placeholder for form handling*/
    toggleDialog();
  };

  const isLogin = mode === "login";

  return (
    <div
      onClick={toggleDialog}  /*Close dialog when clicking outside */
      className="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}  /* Prevents closing when clicking inside the dialog */
        className="relative mx-auto w-full max-w-[24rem] rounded-lg overflow-hidden shadow-sm bg-white"
      >
        <form onSubmit={handleSubmit} className="relative flex flex-col bg-white">        
          <div className="relative m-2.5 items-center flex justify-center text-white h-24 rounded-md bg-orange-500">
            <h3 className="text-2xl font-semibold">
              {isLogin ? "Sign In" : "Create Account"}
            </h3>
          </div>

          <div className="flex flex-col gap-4 p-6">                     
            {!isLogin && (  /* Only shown when NOT in login mode */
              <div className="w-full max-w-sm min-w-[200px]"> 
                <label className="block mb-2 text-sm text-slate-600 font-medium">Full Name</label>
                <input
                  required /* mandatory field */
                  type="text"
                  className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
                />
              </div>
            )}

            <div className="w-full max-w-sm min-w-[200px]">
              <label className="block mb-2 text-sm text-slate-600 font-medium">Email Address</label>
              <input
                required
                type="email"
                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
              />
            </div>

            <div className="w-full max-w-sm min-w-[200px]">
              <label className="block mb-2 text-sm text-slate-600 font-medium">Password</label>
              <input
                required
                type="password"
                className="w-full bg-transparent border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-950"
              />
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              type="submit"
              className="w-full rounded-md bg-slate-800 py-2.5 px-4 text-center text-sm font-semibold text-white hover:bg-green-500 transition-all"
            >
              {isLogin ? "Sign In" : "Register"}
            </button>
            
            <p className="flex justify-center mt-6 text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                className="ml-1 font-bold text-slate-800 hover:underline"
              >
                {isLogin ? "Sign up" : "Login"}
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