import { ErrorMessage, TextInput } from "@shared/ui";
import ShowPassword from "./ShowPassword";
import { useFormContext } from "react-hook-form";

interface PersonalDetailsStepProps {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}

export default function PersonalDetailsStep({
  showPassword,
  setShowPassword,
}: PersonalDetailsStepProps) {
  const { register, formState: { errors }, watch } = useFormContext();
  const watchedValues = watch();

  return (
    <>
      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Full Name
        </label>
        <TextInput
          id="fullName"
          type="text"
          placeholder="Full Name"
          {...register("fullName", {
            required: "Full name is required",
            minLength: { value: 2, message: "Full name must be at least 2 characters" },
          })}
        />
        <ErrorMessage error={errors.fullName?.message as string} />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email Address
        </label>
        <TextInput
          id="email"
          type="email"
          placeholder="Email Address"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
        />
        <ErrorMessage error={errors.email?.message as string} />
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Phone Number
        </label>
        <TextInput
          id="phoneNumber"
          type="tel"
          placeholder="Phone Number"
          {...register("phoneNumber", {
            required: "Phone number is required",
            pattern: {
              value: /^\+?[1-9]\d{1,14}$/,
              message: "Invalid phone number",
            },
          })}
        />
        <ErrorMessage error={errors.phoneNumber?.message as string} />
      </div>

      {/* Password + Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <TextInput
            id="password"
            type="password"
            placeholder="Password"
            showPassword={showPassword}
            icon={
              <ShowPassword
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            }
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
              },
            })}
          />
          <ErrorMessage error={errors.password?.message as string} />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </label>
          <TextInput
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            showPassword={showPassword}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watchedValues.password || "Passwords do not match",
            })}
          />
          <ErrorMessage error={errors.confirmPassword?.message as string} />
        </div>
      </div>
    </>
  );
}
