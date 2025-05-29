import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the login page if the user is not authenticated
    const jwtoken = localStorage.getItem('jwtoken')
    if (jwtoken === null || jwtoken === undefined) {
      navigate('/login')
    }
  })

  return (
    <div>Home</div>
  )
}

export default Home