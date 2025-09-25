type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  
  return (
    <div className="flex justify-center items-center gap-2 mt-6 ">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-60 bg-indigo-600 dark:bg-indigo-700 text-white cursor-pointer"
      >
       &#129088; Prev 
      </button>
      <span className=" font-bold text-gray-900 dark:text-white">{page }</span>
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-60 bg-indigo-600 dark:bg-indigo-700 text-white cursor-pointer"
      >
        Next &#129090;
      </button>
    </div>
  );
}
