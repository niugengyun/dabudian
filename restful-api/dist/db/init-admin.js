import mongoose from 'mongoose';
import Admin from './models/admin.js';
const createInitialAdmin = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const adminData = {
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'super',
                status: true,
            };
            await Admin.create(adminData);
        }
    }
    catch (error) {
        console.error('Error creating initial admin:', error);
        throw error;
    }
};
export default createInitialAdmin;
