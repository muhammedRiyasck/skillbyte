
import {motion} from 'framer-motion'
import type React from 'react';

interface MotionDivProps {
    children : React.ReactNode
    className : string
}


const MotionDiv: React.FC<MotionDivProps> = ({children,className}) => {
  return (
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={className}
      >

        {children}
      
    </motion.div>
  )
}

export default MotionDiv

