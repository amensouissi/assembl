// @flow
import React, { Fragment } from 'react';

import Checkbox101 from '../checkbox101/checkbox101';

type Props = {
  checkboxes: Array<Checkbox101>, // List of checkboxes to display
  onChangeHandler: Function // Required onChangeHandler function
};

const checkboxList101 = ({
  checkboxes,
  onChangeHandler
}: Props) => {
  if (checkboxes.length === 0) {
    return <Fragment>Nothing to display</Fragment>;
  }

  return (
    <Fragment>
      {checkboxes.map(checkbox => (
        <Checkbox101
          // $FlowFixMe
          key={checkbox.label}
          // $FlowFixMe
          label={checkbox.label}
          // $FlowFixMe
          isDone={checkbox.isDone}
          onChangeHandler={onChangeHandler}
        />
      ))}
    </Fragment>
  );
};

checkboxList101.defaultProps = {};

export default checkboxList101;