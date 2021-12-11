import axios from 'axios';

export const login = async (email, password) => {
    // alert(`Email : ${email} and Password : ${password}`);

    try {
        // console.log(email, password);
        // const res = await fetch('http://localhost:8000/api/v1/users/login', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         email: email,
        //         password: password
        //     }),
        // }).then(response => response.json())
        //     .then(data => {
        //         console.log('Success:', data);
        //         if (data.token) {
        //             alert('You are successfully login....');
        //             location.assign('/');
        //         } else {
        //             alert(data.message);
        //         }
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });

        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.token) {
            alert('You are successfully login....');
            location.assign('/');
        }

    } catch (err) {
        alert(err.response.data.message);
    }
};

export const logout = async () => {
    try {

        const res = await axios({
            method: 'GET',
            url: 'http://localhost:8000/api/v1/users/logout'
        });

        if (res.data.status == "success") {
            location.reload(true);
        }

    } catch (err) {
        alert(err);
    }
}

export const signup = async (name, email, role, password, confirmPassword) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/api/v1/users/signup',
            data: {
                name: name,
                email: email,
                role: role,
                password: password,
                passwordConfirm: confirmPassword
            }
        });

        if (res.data.token) {
            alert('You are successfully signup...');
            login(email, password);
        }
    } catch (error) {
        console.log(error);
    }

}

export const updatePassword = async (data) => {
    try {

        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/api/v1/users/updateMyPassword',
            data
        });

        if (res.data.status == 'success') {
            alert('Password update successfully...');
            // login(email, password);
        }

    } catch (error) {
        console.log(error);
    }
}

export const forgotPassword = async (forgotPasswordEmail) => {
    try {

        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/api/v1/users/forgotPassword',
            data: {
                email: forgotPasswordEmail
            }
        });

        if (res.data.status === 'success') {
            alert('Please check your mail. A token sent to your email.');
            // login(email, password);
        }

    } catch (error) {
        console.log(error);
    }
}

// export const resetPassword = async (password, passwordConfirm, resetToken) => {
//     try {

//         const res = await axios({
//             method: 'PATCH',
//             url: `http://localhost:8000/api/v1/users/resetPassword/${resetToken}`,
//             data: {
//                 password: password,
//                 passwordConfirm: passwordConfirm
//             }
//         });

//         if (res.data.status == 'success') {
//             alert('Your password has been reser...');
//             // login(email, password);
//         }

//     } catch (error) {
//         console.log(error);
//     }
// }