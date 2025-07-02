import { Route } from 'react-router-dom';

import SceneLayout from '@/components/SceneLayout';

import Init from './mdx/Init.mdx';
import LocalConversation from './mdx/LocalConversation.mdx';
import Login from './mdx/Login.mdx';
import Scenes from './mdx/Overview.mdx';

export const scenesRoutes = [
  <Route
    path="/scenes"
    element={
      <SceneLayout>
        <Scenes />
      </SceneLayout>
    }
  />,
  <Route
    path="/scenes/init"
    element={
      <SceneLayout>
        <Init />
      </SceneLayout>
    }
  />,
  <Route
    path="/scenes/login"
    element={
      <SceneLayout>
        <Login />
      </SceneLayout>
    }
  />,
  <Route
    path="/scenes/local-conversation"
    element={
      <SceneLayout>
        <LocalConversation />
      </SceneLayout>
    }
  />,
];
