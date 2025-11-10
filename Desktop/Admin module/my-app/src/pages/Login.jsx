import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: code + new password

  // 🟢 Handle Login
  const handleLogin = (e) => {
    e.preventDefault();

    if (email && password) {
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Please enter valid credentials",
        variant: "destructive",
      });
    }
  };

  // 🟠 Handle password reset flow
  const handleReset = (e) => {
    e.preventDefault();

    if (step === 1) {
      // Send verification code (simulate backend)
      toast({
        title: "Verification code sent",
        description: `A reset code has been sent to ${resetEmail}`,
      });
      setStep(2);
    } else if (step === 2) {
      if (verificationCode === "123456" && newPassword.length >= 6) {
        toast({
          title: "Password reset successful",
          description: "You can now log in with your new password",
        });
        setShowReset(false);
        setStep(1);
        setResetEmail("");
        setVerificationCode("");
        setNewPassword("");
      } else {
        toast({
          title: "Invalid details",
          description: "Check your verification code and password",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-200 from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-2xl border border-purple-200">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="App Logo"
              className="w-20 h-20 rounded-full shadow-md object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-700">
            Admin Login
          </CardTitle>
          <CardDescription>
            Administrator login — enter your details to proceed
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!showReset ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[rgb(0,117,166)] hover:bg-[rgb(0,100,145)] text-white transition-all duration-200"
                >
                  Sign In
                </Button>
              </form>

              {/* Forgot password */}
              <p className="text-center mt-4 text-sm text-blue-600 cursor-pointer hover:underline"
                 onClick={() => setShowReset(true)}>
                Forgot Password?
              </p>
            </>
          ) : (
            // 🔐 Reset password form
            <form onSubmit={handleReset} className="space-y-4">
              {step === 1 ? (
                <>
                  <Label htmlFor="resetEmail">Enter your email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="admin@gmail.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Send Code
                  </Button>
                </>
              ) : (
                <>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter code (e.g., 123456)"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Reset Password
                  </Button>
                </>
              )}
              <p
                className="text-center text-sm text-gray-600 cursor-pointer hover:underline"
                onClick={() => {
                  setShowReset(false);
                  setStep(1);
                }}
              >
                Back to Login
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
