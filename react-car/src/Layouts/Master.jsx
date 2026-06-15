import React from 'react'
import { Outlet } from 'react-router-dom'

function Master() {
  return (
    <>
      <header className="bg-gray-900 text-4xl text-center text-amber-50 py-3">
        <h3>CAR PRODUCT</h3>
      </header>

      <div className="container my-5">
        <Outlet />
      </div>
    </>
  )
}

export default Master