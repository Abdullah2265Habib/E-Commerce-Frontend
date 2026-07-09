"use client";
import { Suspense } from 'react';

export default function Loading() {
    // <Script id="counter-script">
    //   {`
    //     let count = 0;
    //     while (count < 10000000000000) {
    //       count++;
    //     }
    //     console.log(count);
    //   `}  
    
    return(
      <>
    <Suspense fallback={<div>Loading...</div>}>LOADING.......................</Suspense>
    </>
  );
}