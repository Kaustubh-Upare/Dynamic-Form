import DynamicForm from './DynamicForm'

const Home = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold">Dynamic Form</h1>
        <DynamicForm />
      </div>
    </div>
  )
}

export default Home