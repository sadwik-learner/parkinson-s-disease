const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About Parkinson AI
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            An AI-assisted screening platform designed to analyze motor
            movements through interactive assessments and provide preliminary
            insights that may indicate Parkinson's disease.
          </p>
        </div>

        {/* Mission */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h2>

          <p className="text-gray-600 leading-8">
            Parkinson's disease affects millions of people worldwide, and early
            identification of motor symptoms can support timely clinical
            evaluation and treatment. Parkinson AI aims to make preliminary
            motor assessments accessible through an intuitive web application
            powered by Artificial Intelligence.
          </p>
        </section>

        {/* Assessments */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Assessment Modules
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl shadow-md p-7">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                Spiral Drawing Assessment
              </h3>

              <p className="text-gray-600 mb-4">
                Users draw a spiral using the mouse or touch input while the
                system records fine motor movements for AI analysis.
              </p>

              <ul className="space-y-2 text-gray-600 list-disc list-inside">
                <li>Drawing precision</li>
                <li>Stroke smoothness</li>
                <li>Tremor-like deviations</li>
                <li>Motor consistency</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-7">
              <h3 className="text-xl font-semibold text-green-600 mb-3">
                Motion Assessment
              </h3>

              <p className="text-gray-600 mb-4">
                Users move the cursor through highlighted targets while the
                system captures movement characteristics associated with motor
                control.
              </p>

              <ul className="space-y-2 text-gray-600 list-disc list-inside">
                <li>Movement trajectory</li>
                <li>Reaction time</li>
                <li>Target accuracy</li>
                <li>Movement smoothness</li>
              </ul>
            </div>

          </div>
        </section>

        {/* AI Analysis */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            AI-Powered Analysis
          </h2>

          <p className="text-gray-600 leading-8">
            After completing the assessments, the collected movement data is
            securely processed by our backend. Machine learning models analyze
            extracted movement features and generate a preliminary prediction
            based on detected motor patterns.
          </p>
        </section>

        {/* Tech Stack */}
        <section className="bg-white rounded-2xl shadow-md p-8 mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Technology Stack
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Frontend
              </h3>

              <ul className="text-gray-600 space-y-2">
                <li>React</li>
                <li>Vite</li>
                <li>Tailwind CSS</li>
                <li>Framer Motion</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Backend
              </h3>

              <ul className="text-gray-600 space-y-2">
                <li>FastAPI</li>
                <li>Python</li>
                <li>REST API</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                AI & Machine Learning
              </h3>

              <ul className="text-gray-600 space-y-2">
                <li>TensorFlow</li>
                <li>Computer Vision</li>
                <li>Motor Pattern Analysis</li>
              </ul>
            </div>

          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-700 mb-3">
            Medical Disclaimer
          </h2>

          <p className="text-gray-700 leading-8">
            Parkinson AI is intended solely for educational, research, and
            preliminary screening purposes. The results generated by this
            application are not a medical diagnosis and should not replace
            consultation with a qualified healthcare professional. If you
            experience symptoms related to Parkinson's disease or other
            neurological conditions, please seek evaluation from a neurologist.
          </p>
        </section>

      </div>
    </div>
  );
};

export default About;