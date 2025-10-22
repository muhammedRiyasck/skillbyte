
import Shimmer from './Shimmer'
 const arr = new Array(6).fill('')
const Card = () => {
  return (
    <div className='min-h-screen dark:bg-gray-900 flex justify-center'>
    <div className='w-3/4 flex-col justify-between m-6'>
       <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3  '>
       { arr.map((_,i)=> <div key={i} className="w-full  shadow-sm bg-gray-100 dark:bg-gray-700 p-4 space-y-1 rounded-lg">
      
        <Shimmer height={160} width="90%" />
        <Shimmer height={30} width="40%" />
        <Shimmer height={30} width="70%" />
        <Shimmer height={20} width="70%" />
        <Shimmer height={20} width="100%" />
    </div>)}
    </div> 
    </div>
    </div>
  )
}


export default Card

