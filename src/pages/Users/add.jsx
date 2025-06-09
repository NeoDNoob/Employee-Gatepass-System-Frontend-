// Components
import UserForm from "@/components/users/UserForm"

export  function AddUserPage() {


  return (
    <div className="container mx-auto">
      <div className="animate-in slide-in-from-top duration-500">
        <h1 className="text-2xl font-bold">Add New User</h1>
        <p className="text-sm text-gray-500 mb-6">Please fill in the form below to add a new user.</p>
      </div>
      <UserForm />
    </div>
  )
} 

export default AddUserPage