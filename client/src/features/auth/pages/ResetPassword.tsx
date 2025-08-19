import{ useState } from 'react'
import { useNavigate, useSearchParams  } from 'react-router-dom'
import Spiner from '../../../shared/ui/Spiner'
import ErrorMessage from '../../../shared/ui/ErrorMessage'
import TextInput from '../../../shared/ui/TextInput'
import logo from '../../../assets/orginal_logo.png'
import { resetPassword } from '../services/AuthService'
import { toast } from 'sonner'
import validatePassword from '../../../shared/validation/Password'
import validateConfirmPassword from '../../../shared/validation/ConfirmPassword'
import ShowPasswordIcon from '../components/ShowPassword'

const ResetPassword = () => {
  const [password,setPassword] = useState('')
  const [confirmPassword,setConfirmPassword] = useState('')
  const [error,setErorr] = useState({password:'',confirmPassword:''})
  const [showPassword,setShowPassword] = useState(false)
  const [loading,setLoading] = useState(false)
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const role = searchParams.get('role')
  const navigate = useNavigate()
  
  const handleSubmit = async (e:React.FormEvent)=>{
      e.preventDefault()

      if(!role){
       toast.error('Role is required,Please fill the forgot password again')
        return
      }
      if(!token){
        toast.error('Token is required,Please fill the forgot password again')
         return
      }

      const isPasswordValid = validatePassword(password)
      const isPasswordConfirmed = validateConfirmPassword(confirmPassword,password)

      setErorr({password:isPasswordValid.message,confirmPassword:isPasswordConfirmed.message})

      if(isPasswordValid.success&&isPasswordConfirmed.success){
       setLoading(true)
      try {
        const response  = await resetPassword({role,token,password})
        navigate('/auth/login')
        toast.success(response.message)
      } finally  {
        setLoading(false)
      }
      }
  }
  return (
      <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 px-4 md:px-8">
        {loading&&<Spiner/>}
      <img className="w-30 h-20 " src={logo} alt="" />
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Logo / Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
          Enter your New Password and Confirm Password.
        </p>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <TextInput
              type="password"
              id="password"
              value={password}
              placeholder="************"
              setValue={setPassword}
              showPassword={showPassword}
              icon={()=><ShowPasswordIcon showPassword={showPassword} setShowPassword={setShowPassword}/>}
            />
              <ErrorMessage error={error.password} />
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>

            <TextInput 
            type='password'
            id='confirmPassword'
            value={confirmPassword}
            placeholder="************"
            setValue={setConfirmPassword}
            showPassword={showPassword}
             />
          </div>
          <ErrorMessage error={error.confirmPassword} />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white font-semibold py-2 px-4 mt-4 rounded-lg transition"
          >
            Send Reset Link
          </button>
        </form>

        </div>
       </div>
       </div>
    )
}

export default ResetPassword

