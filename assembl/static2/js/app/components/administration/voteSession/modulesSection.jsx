// @flow
import React from 'react';
import { I18n } from 'react-redux-i18n';
import { connect } from 'react-redux';
import { Checkbox, SplitButton, MenuItem } from 'react-bootstrap';
import range from 'lodash/range';
import SectionTitle from '../sectionTitle';
import Helper from '../../common/helper';
import TokensForm from './tokensForm';
import GaugeForm from './gaugeForm';
import {
  createTokenVoteModule,
  deleteTokenVoteModule,
  createGaugeVoteModule,
  deleteGaugeVoteModule
} from '../../../actions/adminActions/voteSession';

type ModulesSectionProps = {
  tokenModules: Object,
  editLocale: string,
  handleTokenCheckBoxChange: Function,
  handleGaugeCheckBoxChange: Function
};

const DumbModulesSection = ({
  tokenModules,
  editLocale,
  handleTokenCheckBoxChange,
  gaugeModules,
  handleGaugeCheckBoxChange
}: ModulesSectionProps) => {
  const tokenModuleChecked = tokenModules.size > 0;
  const gaugeModuleChecked = gaugeModules.size > 0;
  const tModule = tokenModules.toJS();
  const gModule = gaugeModules.toJS();
  return (
    <div className="admin-box">
      <SectionTitle title={I18n.t('administration.voteSession.1')} annotation={I18n.t('administration.annotation')} />
      <div className="admin-content">
        <div className="form-container">
          <div>
            <Checkbox
              checked={tokenModuleChecked}
              onChange={() => {
                handleTokenCheckBoxChange(tokenModuleChecked, tModule[0]);
              }}
            >
              <Helper
                label={I18n.t('administration.voteWithTokens')}
                helperUrl="/static2/img/helpers/helper4.png"
                helperText={I18n.t('administration.tokenVoteCheckbox')}
                classname="inline"
              />
            </Checkbox>
            {tokenModules.map(id => <TokensForm key={id} id={id} editLocale={editLocale} />)}
            <Checkbox
              checked={gaugeModuleChecked}
              onChange={() => {
                handleGaugeCheckBoxChange(gaugeModuleChecked, gModule[0]);
              }}
            >
              <Helper
                label={I18n.t('administration.voteWithGages')}
                helperUrl="/static2/img/helpers/helper3.png" // TODO: add an actual screenshot
                helperText={I18n.t('administration.gaugeVoteCheckbox')}
                classname="inline"
              />
            </Checkbox>
            <div className="flex">
              <label htmlFor="input-dropdown-addon">Nombre de jauges</label>
              <Helper helperUrl="/static2/img/helpers/helper2.png" helperText="Définissez le nombre de jauges" />
            </div>
            <SplitButton title={gaugeModules.size} id="input-dropdown-addon" required>
              {range(11).map(value => (
                <MenuItem key={`gauge-item-${value}`} eventKey={value}>
                  {value}
                </MenuItem>
              ))}
            </SplitButton>
            {gaugeModules.map(id => <GaugeForm key={id} id={id} />)}
            {/* <label htmlFor="visible-vote-radio">
              Voulez-vous que les participants puissent voir l evolution du vote en cours ?
            </label>
            <FormGroup id="visible-vote-radio">
              <Radio>Oui</Radio>
              <Radio>Non</Radio>
            </FormGroup> */}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ admin }) => {
  const { modulesInOrder, modulesById } = admin.voteSession;
  const { editLocale } = admin;
  return {
    tokenModules: modulesInOrder.filter(
      id => modulesById.getIn([id, 'type']) === 'tokens' && !modulesById.getIn([id, 'toDelete'])
    ),
    gaugeModules: modulesInOrder.filter(
      id =>
        modulesById.getIn([id, 'type']) === 'numberGauge' ||
        (modulesById.getIn([id, 'type']) === 'textGauge' && !modulesById.getIn([id, 'toDelete']))
    ),
    editLocale: editLocale
  };
};

const mapDispatchToProps = (dispatch) => {
  const newId = Math.round(Math.random() * -1000000).toString();
  return {
    handleTokenCheckBoxChange: (checked, id) => {
      if (!checked) {
        dispatch(createTokenVoteModule(newId));
      } else {
        dispatch(deleteTokenVoteModule(id));
      }
    },
    handleGaugeCheckBoxChange: (checked, id) => {
      if (!checked) {
        dispatch(createGaugeVoteModule(newId));
      } else {
        dispatch(deleteGaugeVoteModule(id));
      }
    }
  };
};

export { DumbModulesSection };

export default connect(mapStateToProps, mapDispatchToProps)(DumbModulesSection);