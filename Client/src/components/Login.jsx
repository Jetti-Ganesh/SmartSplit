import { useFormik } from 'formik';
import axios from 'axios';
export function Login() {
    const loginDetailer = useFormik(
        {
            initialValues:
            {
                userName: "",
                password: "",
            },
            onSubmit: async (values) => {
                console.log(values);
                await axios.post("http://localhost:3000/login", (values)).then((res) => {
                    console.log(res);
                })
            }
        }
    )
    return (
        <>
            <h3>SignUp Page</h3>
            <form action="" method="POST" onSubmit={loginDetailer.handleSubmit}>
                <label for="name">UserName</label>
                <input type="text" id="name" placeholder="Enter Your Name" {...loginDetailer.getFieldProps("userName")}></input><br></br>
                <label for="pass">Password</label>
                <input type="password" id="pass" placeholder="Enter Password"  {...loginDetailer.getFieldProps("password")}></input><br></br>
                <button type="submit">Login</button>
            </form>
        </>
    );
}