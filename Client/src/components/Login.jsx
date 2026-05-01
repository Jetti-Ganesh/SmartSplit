import { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import './login.css';

export function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const loginDetailer = useFormik({
        initialValues: {
            userName: "",
            password: "",
            rememberMe: false
        },
        onSubmit: async (values) => {
            console.log(values);
            await axios.post("http://localhost:3000/login", values).then((res) => {
                console.log(res);
            });
        }
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="split-container">
            <div className="login-card">
                {/* Left Panel */}
                <div className="login-left">
                    <div className="left-bg"></div>
                    <div className="left-content">
                        <div className="logo-container">
                            <div className="logo-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <h2>SmartSplit</h2>
                        </div>
                        <h1 className="welcome-title">Welcome Back!</h1>
                        <p className="welcome-desc">
                            To stay connected and manage your expenses effortlessly, please log in with your personal info.
                        </p>
                        <button className="outline-btn" type="button">SIGN UP</button>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="login-right">
                    <div className="right-content">
                        <div className="mobile-logo">
                            <div className="logo-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <h2>SmartSplit</h2>
                        </div>

                        <h2 className="signin-title">Sign In</h2>
                        <p className="signin-desc">Access your account to continue</p>

                        <form className="login-form" method="POST" onSubmit={loginDetailer.handleSubmit}>
                            <div className="input-wrapper">
                                <div className="input-icon left-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="userName"
                                    className="pill-input has-left-icon"
                                    placeholder="Email or Username"
                                    {...loginDetailer.getFieldProps("userName")}
                                />
                            </div>

                            <div className="input-wrapper">
                                <div className="input-icon left-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="pill-input has-both-icons"
                                    placeholder="Password"
                                    {...loginDetailer.getFieldProps("password")}
                                />
                                <button
                                    type="button"
                                    className="input-icon right-icon toggle-password"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="form-options">
                                <div className="remember-me-container">
                                    <label className="remember-me">
                                        <input
                                            type="checkbox"
                                            {...loginDetailer.getFieldProps("rememberMe")}
                                        />
                                        <span className="custom-check"></span>
                                        Remember me
                                    </label>
                                </div>
                                <a href="#" className="forgot-pass">Forgot password?</a>
                            </div>

                            <button type="submit" className="solid-btn">LOG IN</button>

                            <p className="signup-prompt">
                                Don't have an account? <a href="#">Sign up</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}