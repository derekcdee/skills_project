import { useState } from 'react'
import Overlay from './components/overlay';
import Background from './components/background';

function App() {
  const [exited, setExited] = useState(false);

  return (
    <main>
      <Overlay exited={exited} />
      <Background setExited={setExited} />
    </main>
  )
}

export default App