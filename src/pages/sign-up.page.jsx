import { SignUp } from "@clerk/clerk-react";

function SignUpPage(){
    return(
        <main className="flex items-center justify-center min-h-screen px-4">
            <SignUp
                forceRedirectUrl="/"
                signInUrl="/sign-in"
            />
        </main>
    )
}

export default SignUpPage;