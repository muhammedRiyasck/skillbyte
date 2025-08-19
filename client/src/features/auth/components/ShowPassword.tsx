import closed_eye from '../../../assets/EyeClose.svg'
import opened_eye from '../../../assets/EyeOpen.svg'

type ShowPasswordProps = {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
};

const ShowPassword = ({ showPassword, setShowPassword }: ShowPasswordProps) => {
  return (
    <span className='cursor-pointer ' onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <img className='w-6 ' src={opened_eye} alt="hide" /> : <img className='w-6' src={closed_eye} alt="hide" />}
    </span>
  );
};

export default ShowPassword;
