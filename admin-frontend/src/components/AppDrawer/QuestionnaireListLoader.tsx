import Skeleton from '@mui/material/Skeleton';
import * as R from 'ramda';

function QuestionnaireListLoader() {
  const rows = 3;

  return (
    <>
      {R.range(0, rows).map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width={160}
          height={18}
          sx={{ m: 2.2, ml: 3, mr: 3, borderRadius: 1 }}
        />
      ))}
    </>
  );
}

export default QuestionnaireListLoader;
