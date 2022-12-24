import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import Login from './components/Login';
import EditCategory from './routes/EditCategory';
import Help from './routes/Help';
import Home from './routes/Home';
import QuestionnaireContentManagement from './routes/QuestionnaireContentManagement';
import QuestionnaireGame from './routes/QuestionnaireGame';
import QuestionnaireUserManagement from './routes/QuestionnaireUserManagement';
import paths from './routes/paths';

function App() {
  return (
    <Router>
      <AppLayout>
        <Switch>
          <AuthenticatedRoute path={paths.EDIT_CATEGORY}>
            <EditCategory />
          </AuthenticatedRoute>

          <AuthenticatedRoute path={paths.CONTENT_MANAGEMENT}>
            <QuestionnaireContentManagement />
          </AuthenticatedRoute>

          <AuthenticatedRoute path={paths.USER_MANAGEMENT}>
            <QuestionnaireUserManagement />
          </AuthenticatedRoute>

          <AuthenticatedRoute path={paths.QUESTIONNAIRE}>
            <QuestionnaireGame />
          </AuthenticatedRoute>

          <AuthenticatedRoute path={paths.HELP}>
            <Help />
          </AuthenticatedRoute>

          <Route path={paths.LOGIN}>
            <Login />
          </Route>

          <AuthenticatedRoute path={paths.HOME} exact>
            <Home />
          </AuthenticatedRoute>
        </Switch>
      </AppLayout>
    </Router>
  );
}

export default App;
