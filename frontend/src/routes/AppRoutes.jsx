import { Route, Routes } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Home from '../pages/Home'
import About from '../pages/About'
import Assessment from '../pages/Assessment'
import SpiralAssessment from '../pages/SpiralAssessment'
import HandwritingAssessment from '../pages/HandwritingAssessment'
import MotionAssessment from '../pages/MotionAssessment'
import Results from '../pages/Results'
import NotFound from '../pages/NotFound'

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/assessment/spiral" element={<SpiralAssessment />} />
        <Route path="/assessment/handwriting" element={<HandwritingAssessment />} />
        <Route path="/assessment/motion" element={<MotionAssessment />} />
        <Route path="/results" element={<Results />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default AppRoutes
