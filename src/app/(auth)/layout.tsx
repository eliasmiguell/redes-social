

function AuthForm({ children }: { children: React.ReactNode }) {
  return (
    <main 
      style={{ backgroundImage: `url(${'/images/fundo_redes.jpg'})` }}
      className="bg-no-repeat bg-cover flex min-h-screen flex-col items-center justify-center p-4"
    >
      <div className="flex flex-col bg-white px-6 py-8 sm:py-14 rounded-2xl gap-8 sm:gap-11 w-full max-w-sm sm:w-96 md:w-2/6 lg:w-1/4 text-gray-600">
        {children}
      </div>
    </main>
  )
}

export default AuthForm;