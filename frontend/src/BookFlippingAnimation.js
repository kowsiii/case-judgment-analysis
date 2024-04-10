import React from 'react'
import Lottie from 'react-lottie'
import bookFlipAnimationData from './assets/bookLoading.json'

export const BookFlippingAnimation = ({ height, width }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: bookFlipAnimationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }

  return (
    <div>
      <Lottie options={defaultOptions} height={height} width={width} />
    </div>
  )
}
