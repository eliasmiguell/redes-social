

function  AuthForm( {children}:{children:React.ReactNode}) {
  return(
    <main style={{ backgroundImage: `url(${'/images/fundo_redes.jpg'})`}}className=" bg-no-repat bg-cover flex min-h-screen flex-col  items-center justify-center">
      <form className = "flex flex-col bg-white px-6 py-14 rounded-2xl gap-11 sm:w-1/4 md:w-2/6 lg:w-1/4 text-gray-600 w-3/5">
            {children}
      </form>
    </main>
  )
}
export default AuthForm;