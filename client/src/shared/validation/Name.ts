export default function isNameValid(name: string): {success: boolean,message: string}  {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name || name.trim() === '') {
        return {success:false, message: 'Name is required'};
    }
    if (name.length < 3) {
        return {success: false, message: 'Name must be at least 3 characters long'};
    }
    if (!nameRegex.test(name)) {
        return {success: false, message: 'Name can only contain letters and spaces'};
    }
    return {success: true , message:''};
}
