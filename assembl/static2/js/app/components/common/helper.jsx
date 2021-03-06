// @flow
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import classnames from 'classnames';

type HelperProps = {
  label?: string,
  helperUrl?: string,
  helperText: string,
  classname?: string,
  additionalTextClasses?: string,
  popOverClass?: string
};

const overflowMenu = (helperUrl, helperText, additionalTextClasses, popOverClass) => {
  const helperTextClasses = classnames([additionalTextClasses], 'helper-text');
  return (
    <Popover id="admin-title-helper" className={popOverClass || 'helper-popover'}>
      {helperUrl && <img src={helperUrl} width="300" height="auto" alt="admin-helper" />}
      <div className={helperTextClasses}>{helperText}</div>
    </Popover>
  );
};

const Helper = ({ label, helperUrl, helperText, classname, additionalTextClasses, popOverClass }: HelperProps) => (
  <div className={classname}>
    {label && label}
    &nbsp;
    <OverlayTrigger
      trigger={['hover', 'focus']}
      rootClose
      placement="right"
      overlay={overflowMenu(helperUrl, helperText, additionalTextClasses, popOverClass)}
    >
      <span className="assembl-icon-faq grey pointer" />
    </OverlayTrigger>
  </div>
);

Helper.defaultProps = {
  label: '',
  helperUrl: '',
  classname: '',
  additionalTextClasses: '',
  popOverClass: ''
};

export default Helper;