import React from 'react'
import Sidebar from '../components/Sidebar'

export default function Layout({children}){
  return (
    <div className="min-h-screen">
      <Sidebar/>
        <main className='lg:ml-64 p-6'>{children}</main>
    </div>
  );
}

