export default function isConfirmPasswordValid(confirmPassword: string, password: string): {success: boolean,message: string}  {
    if (!confirmPassword || confirmPassword.trim() === '') {
        return {success: false, message: 'Confirm Password is required'};
    }
    if (confirmPassword !== password) {
        return {success: false, message: "ⓧ Password didn't match"};
    }
    return {success: true , message: '' };
}
