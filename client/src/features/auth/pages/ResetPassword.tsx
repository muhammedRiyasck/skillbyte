import{ useState } from 'react'
import { useNavigate, useSearchParams  } from 'react-router-dom'
import { ROUTES } from "@core/router/paths";
import { Spiner, ErrorMessage, TextInput } from '@shared/ui'
import logo from '../../../assets/OrginalLogo.png'
import { resetPassword } from '../'
import { toast } from 'sonner'
import { isPasswordValid, isConfirmPasswordValid } from '@shared/validation'
import { ShowPassword } from '../'

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

      const passwordValid = isPasswordValid(password)
      const confirmPasswordValid = isConfirmPasswordValid(password, confirmPassword)

      setErorr({password:passwordValid.message,confirmPassword:confirmPasswordValid.message})

      if(passwordValid.success&&confirmPasswordValid.success){
       setLoading(true)
      try {
        const response  = await resetPassword({role,token,password})
        navigate(ROUTES.auth.signIn)
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
              id="password"
              type="password"
              value={password}
              placeholder="************"
              onChange={(e)=>setPassword(e.target.value)}
              showPassword={showPassword}
              icon={<ShowPassword showPassword={showPassword} setShowPassword={setShowPassword}/>}
            />
              <ErrorMessage error={error.password} />
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>

            <TextInput 
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            placeholder="************"
            onChange={(e)=>setConfirmPassword(e.target.value)}
            showPassword={showPassword}
             />
          </div>
          <ErrorMessage error={error.confirmPassword} />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white font-semibold py-2 px-4 mt-4 rounded-lg transition"
          >
            Reset Passoword
          </button>
        </form>

        </div>
       </div>
       </div>
    )
}

export default ResetPassword

