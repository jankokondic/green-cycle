import { useState } from 'react';
import { registerUser } from '../api/api';
import './css/login.css'
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        file: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'file' ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await registerUser(form);
            console.log('Registration successful:', res);
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err.response?.data || err.message);
        }
    };

    return (
            <div className='login-center'>
                <form className='register-form' onSubmit={handleSubmit} encType="multipart/form-data">
                    <h2>Register form</h2>
                    <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                    <input type="file" name="file" accept="image/*" onChange={handleChange} required />
                    <button type="submit">Register</button>
                </form>
            </div>
    );
};

export default Register;