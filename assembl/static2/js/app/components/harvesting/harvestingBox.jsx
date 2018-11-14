// @flow
import * as React from 'react';
import ARange from 'annotator_range'; // eslint-disable-line
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import { Button, OverlayTrigger } from 'react-bootstrap';
import { Translate, I18n } from 'react-redux-i18n';
import classnames from 'classnames';
import moment from 'moment';

import addPostExtractMutation from '../../graphql/mutations/addPostExtract.graphql';
import updateExtractMutation from '../../graphql/mutations/updateExtract.graphql';
import deleteExtractMutation from '../../graphql/mutations/deleteExtract.graphql';
import confirmExtractMutation from '../../graphql/mutations/confirmExtract.graphql';
import updateExtractTagsMutation from '../../graphql/mutations/updateExtractTags.graphql';
import manageErrorAndLoading from '../../components/common/manageErrorAndLoading';
import { getConnectedUserId, getConnectedUserName } from '../../utils/globalFunctions';
import AvatarImage from '../common/avatarImage';
import TaxonomyOverflowMenu from './taxonomyOverflowMenu';
import FormControlWithLabel from '../common/formControlWithLabel';
import { displayAlert, displayModal, closeModal } from '../../utils/utilityManager';
import { editExtractTooltip, deleteExtractTooltip, nuggetExtractTooltip, qualifyExtractTooltip } from '../common/tooltips';
import { NatureIcons, ActionIcons } from '../../utils/extract';
import { ExtractStates } from '../../constants';
import TagsForm from './tagsForm';

type Props = {
  extracts?: Array<Extract>,
  postId: string,
  contentLocale: string,
  lang?: string,
  selection: ?Object,
  harvestingDate?: string,
  isAuthorAccountDeleted?: boolean,
  showNuggetAction?: boolean,
  displayHarvestingBox: boolean,
  setHarvestingBoxDisplay: Function,
  cancelHarvesting: Function,
  addPostExtract: Function,
  updateExtract: Function,
  confirmExtract: Function,
  deleteExtract: Function,
  refetchPost: Function,
  toggleExtractsBox?: Function
};

type State = {
  extractIndex: number,
  disabled: boolean,
  extractIsValidated: boolean,
  isNugget: boolean,
  isEditable: boolean,
  editableExtract: string,
  extractNature: ?string,
  extractAction: ?string,
  menuTarget: HTMLElement | null,
  overflowMenu: ?HTMLElement,
  overflowMenuTop: number
};

type Taxonomies = {
  nature: ?string,
  action: ?string
};

const ACTIONS = {
  create: 'create', // create a new extract
  edit: 'edit', // edit an extract
  confirm: 'confirm' // confirm a submitted extract
};

class DumbHarvestingBox extends React.Component<Props, State> {
  menu: any;

  actions: any;

  static defaultProps = {
    harvestingDate: null,
    isAuthorAccountDeleted: false,
    showNuggetAction: true
  };

  constructor(props: Props) {
    super(props);
    const { extracts, cancelHarvesting } = this.props;
    const hasExtract = extracts ? extracts.length > 0 : false;
    const extract = this.getCurrentExtract(0);
    const isNugget = extract ? extract.important : false;
    this.state = {
      extractIndex: 0,
      disabled: !hasExtract,
      extractIsValidated: hasExtract,
      isNugget: isNugget,
      isEditable: false,
      editableExtract: extract ? extract.body : '',
      extractNature: extract && extract.extractNature ? extract.extractNature.split('.')[1] : null,
      extractAction: extract && extract.extractAction ? extract.extractAction.split('.')[1] : null,
      menuTarget: null,
      overflowMenu: null,
      overflowMenuTop: 25
    };
    // actions props
    this.actions = {
      [ACTIONS.create]: {
        buttons: [
          { id: 'cancel', title: 'debate.confirmDeletionButtonCancel', className: 'button-cancel', onClick: cancelHarvesting },
          { id: 'validate', title: 'harvesting.submit', className: 'button-submit', onClick: this.validateHarvesting }
        ]
      },
      [ACTIONS.edit]: {
        buttons: [
          { id: 'cancel', title: 'debate.confirmDeletionButtonCancel', className: 'button-cancel', onClick: this.setEditMode },
          {
            id: 'validate',
            title: 'harvesting.submit',
            className: 'button-submit',
            onClick: this.updateHarvestingBody
          }
        ]
      },
      [ACTIONS.confirm]: {
        buttons: [
          { id: 'reject', title: 'harvesting.reject', className: 'button-cancel', onClick: this.deleteHarvesting },
          { id: 'confirm', title: 'harvesting.confirm', className: 'button-submit', onClick: this.confirmHarvesting }
        ]
      }
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.updateOverflowMenuPosition);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateOverflowMenuPosition);
  }

  getCurrentExtract = (extractIndex: number) => {
    const { extracts } = this.props;
    return extracts && extracts.length > 0 ? extracts[extractIndex] : null;
  };

  setEditMode = (): void => {
    const { isEditable } = this.state;
    this.setState({ isEditable: !isEditable });
  };

  editExtract = (value: string): void => {
    this.setState({ editableExtract: value });
  };

  qualifyExtract = (taxonomies: Taxonomies): void => {
    this.setState({ menuTarget: null });
    const { nature, action } = taxonomies;
    const { updateExtract, refetchPost } = this.props;
    const { extractIndex } = this.state;
    const extract = this.getCurrentExtract(extractIndex);
    const { isNugget } = this.state;
    const variables = {
      extractId: extract ? extract.id : null,
      important: isNugget,
      extractNature: nature,
      extractAction: action
    };
    displayAlert('success', I18n.t('loading.wait'));
    updateExtract({ variables: variables })
      .then(() => {
        this.setState({ extractNature: nature, extractAction: action });
        displayAlert('success', I18n.t('harvesting.harvestingSuccess'));
        refetchPost();
      })
      .catch((error) => {
        displayAlert('danger', `${error}`);
      });
  };

  updateHarvestingNugget = (): void => {
    const { updateExtract, refetchPost } = this.props;
    const { isNugget, extractNature, extractAction, extractIndex } = this.state;
    const extract = this.getCurrentExtract(extractIndex);
    const variables = {
      extractId: extract ? extract.id : null,
      important: !isNugget,
      extractNature: extractNature,
      extractAction: extractAction
    };
    displayAlert('success', I18n.t('loading.wait'));
    updateExtract({ variables: variables })
      .then(() => {
        this.setState({
          isNugget: !isNugget
        });
        displayAlert('success', I18n.t('harvesting.harvestingSuccess'));
        refetchPost();
      })
      .catch((error) => {
        displayAlert('danger', `${error}`);
      });
  };

  updateHarvestingBody = (): void => {
    const { updateExtract, refetchPost } = this.props;
    const { editableExtract, isNugget, extractNature, extractAction, extractIndex } = this.state;
    const extract = this.getCurrentExtract(extractIndex);
    const variables = {
      extractId: extract ? extract.id : null,
      body: editableExtract,
      important: isNugget,
      extractNature: extractNature,
      extractAction: extractAction
    };
    displayAlert('success', I18n.t('loading.wait'));
    updateExtract({ variables: variables })
      .then(() => {
        this.setState({
          isEditable: false
        });
        displayAlert('success', I18n.t('harvesting.harvestingSuccess'));
        refetchPost();
      })
      .catch((error) => {
        displayAlert('danger', `${error}`);
      });
  };

  confirmHarvestingDeletion = (): void => {
    const modalTitle = <Translate value="harvesting.deleteExtract" />;
    const body = <Translate value="harvesting.confirmDeleteExtract" />;
    const footer = [
      <Button key="cancel" onClick={closeModal} className="button-cancel button-dark">
        <Translate value="debate.confirmDeletionButtonCancel" />
      </Button>,
      <Button key="delete" onClick={this.deleteHarvesting} className="button-submit button-dark">
        <Translate value="validate" />
      </Button>
    ];
    const includeFooter = true;
    return displayModal(modalTitle, body, includeFooter, footer);
  };

  deleteHarvesting = (): void => {
    const { deleteExtract, refetchPost } = this.props;
    const { extractIndex } = this.state;
    const extract = this.getCurrentExtract(extractIndex);
    const variables = {
      extractId: extract ? extract.id : null
    };
    closeModal();
    displayAlert('success', I18n.t('loading.wait'));
    deleteExtract({ variables: variables })
      .then(() => {
        refetchPost().then(() => {
          displayAlert('success', I18n.t('harvesting.harvestingDeleted'));
          this.changeCurrentExtract();
        });
      })
      .catch((error) => {
        displayAlert('danger', `${error}`);
      });
  };

  validateHarvesting = (): void => {
    const { postId, selection, contentLocale, lang, addPostExtract, setHarvestingBoxDisplay, refetchPost } = this.props;
    if (!selection) {
      return;
    }
    const selectionText = selection.toString();
    const annotatorRange = ARange.sniff(selection.getRangeAt(0));
    if (!annotatorRange) {
      return;
    }
    const serializedAnnotatorRange = annotatorRange.serialize(document, 'annotation');
    if (!serializedAnnotatorRange) {
      return;
    }
    const variables = {
      contentLocale: contentLocale,
      postId: postId,
      body: selectionText,
      important: false,
      lang: lang,
      xpathStart: serializedAnnotatorRange.start,
      xpathEnd: serializedAnnotatorRange.end,
      offsetStart: serializedAnnotatorRange.startOffset,
      offsetEnd: serializedAnnotatorRange.endOffset
    };
    displayAlert('success', I18n.t('loading.wait'));
    addPostExtract({ variables: variables })
      .then(() => {
        this.setState({
          disabled: false,
          extractIsValidated: true
        });
        setHarvestingBoxDisplay();
        window.getSelection().removeAllRanges();
        displayAlert('success', I18n.t('harvesting.harvestingValidated'));
        refetchPost();
      })
      .catch((error) => {
        displayAlert('danger', `${error}`);
      });
  };

  confirmHarvesting = (): void => {
    const { confirmExtract, refetchPost } = this.props;
    const { extractIndex } = this.state;
    const extract = this.getCurrentExtract(extractIndex);
    const variables = {
      extractId: extract ? extract.id : null
    };
    closeModal();
    displayAlert('success', I18n.t('loading.wait'));
    confirmExtract({ variables: variables })
      .then(() => {
        displayAlert('success', I18n.t('harvesting.harvestingConfirmed'));
        refetchPost();
      })
      .catch((error) => {
        displayAlert('danger', `${error}`);
      });
  };

  showValidatedHarvesting = (nature: ?string, action: ?string) => {
    if (nature && action) {
      return (
        <div className="harvesting-taxonomy-label">
          {`${I18n.t(`search.taxonomy_nature.${nature}`)} + ${I18n.t(`search.taxonomy_action.${action}`)}`}
        </div>
      );
    } else if (nature) {
      return <div className="harvesting-taxonomy-label">{I18n.t(`search.taxonomy_nature.${nature}`)}</div>;
    }
    return action ? <div className="harvesting-taxonomy-label">{I18n.t(`search.taxonomy_action.${action}`)}</div> : null;
  };

  updateOverflowMenu = (node: HTMLElement) => {
    if (node) {
      this.setState({ overflowMenu: node });
    }
  };

  updateOverflowMenuPosition = () => {
    const { overflowMenu } = this.state;
    if (overflowMenu) {
      const height = overflowMenu.clientHeight;
      const bottomScroll = window.pageYOffset + height;
      const windowHeight = document.body && document.body.scrollHeight;
      const isBottomReached = windowHeight && bottomScroll >= windowHeight - window.innerHeight;
      if (isBottomReached) {
        this.setState({ overflowMenuTop: -320 });
      } else {
        this.setState({ overflowMenuTop: 25 });
      }
    }
  };

  changeCurrentExtract = (step: ?number): void => {
    const { extractIndex } = this.state;
    const idx = step ? extractIndex + step : 0;
    const extract = this.getCurrentExtract(idx);
    const isNugget = extract ? extract.important : false;
    this.setState(prevState => ({
      extractIndex: step ? prevState.extractIndex + step : 0,
      isNugget: isNugget,
      extractNature: extract && extract.extractNature ? extract.extractNature.split('.')[1] : null,
      extractAction: extract && extract.extractAction ? extract.extractAction.split('.')[1] : null,
      editableExtract: extract ? extract.body : '',
      menuTarget: null
    }));
  };

  renderFooter = () => {
    const { disabled, isEditable, extractIndex } = this.state;
    const extract = this.getCurrentExtract(extractIndex);
    const extractState = extract && extract.extractState;
    const isSubmitted = extractState === ExtractStates.SUBMITTED;
    const actionId = isEditable ? ACTIONS.edit : (disabled && ACTIONS.create) || (isSubmitted && ACTIONS.confirm);
    if (!actionId) return null;
    const action = this.actions[actionId];
    return (
      <div className="harvesting-box-footer">
        {action.buttons.map(button => (
          <Button key={button.id} className={`${button.className} button-dark`} onClick={button.onClick}>
            {I18n.t(button.title)}
          </Button>
        ))}
      </div>
    );
  };

  render() {
    const {
      selection,
      contentLocale,
      harvestingDate,
      isAuthorAccountDeleted,
      showNuggetAction,
      extracts,
      toggleExtractsBox,
      displayHarvestingBox,
      cancelHarvesting
    } = this.props;
    const {
      disabled,
      extractIsValidated,
      isNugget,
      isEditable,
      editableExtract,
      extractNature,
      extractAction,
      menuTarget,
      overflowMenuTop,
      extractIndex
    } = this.state;
    const extract = this.getCurrentExtract(extractIndex);
    const hasExtract = extract !== null;
    const selectionText = selection ? selection.toString() : '';
    const harvesterUserName =
      extract && extract.creator && extract.creator.displayName ? extract.creator.displayName : getConnectedUserName();
    const extractState = extract && extract.extractState;
    const isSubmitted = extractState === ExtractStates.SUBMITTED;
    const userName = isAuthorAccountDeleted ? I18n.t('deletedUser') : harvesterUserName;
    const harvesterUserId = extract && extract.creator && extract.creator.userId ? extract.creator.userId : getConnectedUserId();
    const menuDisabled = disabled || isSubmitted;
    const hasFooter = disabled || isEditable || isSubmitted;
    // TODO remove. get the extract tags
    const tags = ['Cool tag', 'Un autre tag', 'Et un autre'];
    return (
      <div className={isSubmitted ? 'submitted-harvesting' : ''}>
        <div>
          <div className="harvesting-close-button" onClick={displayHarvestingBox ? cancelHarvesting : toggleExtractsBox}>
            <span className="assembl-icon-cancel grey" />
          </div>
        </div>
        {(extractNature || extractAction) && (
          <div>
            <div className="box-icon">
              {extractNature && <NatureIcons qualifier={extractNature} />}
              {extractAction && !extractNature && <ActionIcons qualifier={extractAction} backgroundColor="#fff" color="#000" />}
            </div>
            {extractNature &&
              extractAction && (
                <div className="box-icon box-icon-2">
                  <ActionIcons qualifier={extractAction} backgroundColor="#fff" color="#000" />
                </div>
              )}
          </div>
        )}
        <div
          className={classnames('theme-box', 'harvesting-box', {
            'active-box': extractIsValidated
          })}
        >
          <div className="harvesting-box-header">
            {extracts && (
              <div className="extracts-nb-msg">
                <Translate count={extracts.length} value="harvesting.harvestedExtractNumbers" extractNumber={extracts.length} />
              </div>
            )}
            <div className="harvesting-status">
              {disabled ? (
                <div className="harvesting-in-progress">
                  <div className="harvesting-status-label">
                    <Translate value="harvesting.inProgress" />
                  </div>
                </div>
              ) : (
                <div>
                  {extractNature || extractAction ? (
                    <div className="validated-harvesting">{this.showValidatedHarvesting(extractNature, extractAction)}</div>
                  ) : (
                    !isSubmitted && (
                      <div className="validated-harvesting">
                        <div className="harvesting-status-label">
                          <Translate value="harvesting.validated" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            <div className="button-bar">
              <OverlayTrigger placement="top" overlay={editExtractTooltip}>
                <Button disabled={menuDisabled} onClick={this.setEditMode} className={classnames({ active: isEditable })}>
                  <span className="assembl-icon-edit grey" />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement="top" overlay={deleteExtractTooltip}>
                <Button disabled={menuDisabled} onClick={this.confirmHarvestingDeletion}>
                  <span className="assembl-icon-delete grey" />
                </Button>
              </OverlayTrigger>
              {showNuggetAction && (
                <OverlayTrigger placement="top" overlay={nuggetExtractTooltip}>
                  <Button
                    disabled={menuDisabled}
                    onClick={this.updateHarvestingNugget}
                    className={classnames({ active: isNugget })}
                  >
                    <span className="assembl-icon-pepite grey" />
                  </Button>
                </OverlayTrigger>
              )}
              <OverlayTrigger placement="top" overlay={qualifyExtractTooltip}>
                <Button
                  disabled={menuDisabled}
                  className="taxonomy-menu-btn"
                  onClick={(e) => {
                    this.setState({ menuTarget: !menuTarget ? e.target : null });
                  }}
                >
                  <span className="assembl-icon-ellipsis-vert grey" />
                </Button>
              </OverlayTrigger>
              {menuTarget && (
                <TaxonomyOverflowMenu
                  innerRef={this.updateOverflowMenu}
                  handleClick={this.qualifyExtract}
                  extractNature={extractNature}
                  extractAction={extractAction}
                  target={menuTarget}
                  onCloseClick={() => {
                    this.setState({ menuTarget: null });
                  }}
                  top={overflowMenuTop}
                />
              )}
            </div>
            <div className="profile">
              <AvatarImage userId={harvesterUserId} userName={userName} />
              <div className="harvesting-infos">
                <div className="username">{userName}</div>
                {hasExtract &&
                  extract &&
                  extract.creationDate && (
                    <div className="harvesting-date" title={extract.creationDate}>
                      {harvestingDate ||
                        moment(extract.creationDate)
                          .locale(contentLocale)
                          .fromNow()}
                    </div>
                  )}
                {!hasExtract && (
                  <div className="harvesting-date">
                    <Translate value="harvesting.now" />
                  </div>
                )}
              </div>
            </div>
          </div>
          {isSubmitted && (
            <div className="harvesting-submitted-message">
              <span className="confirm-harvest-button assembl-icon-catch" />
              <Translate value="harvesting.harvestingSubmitted" />
            </div>
          )}
          <div className="harvesting-box-body">
            {hasExtract &&
              extract &&
              !isEditable && (
                <div className="body-container">
                  <div className="previous-extract">
                    {extractIndex > 0 && (
                      <div
                        onClick={() => {
                          this.changeCurrentExtract(-1);
                        }}
                      >
                        <span className="assembl-icon-down-open grey" />
                      </div>
                    )}
                  </div>
                  <div className="extract-body">{extract.body}</div>
                  <div className="next-extract">
                    {extracts &&
                      extractIndex < extracts.length - 1 && (
                        <div
                          onClick={() => {
                            this.changeCurrentExtract(1);
                          }}
                        >
                          <span className="assembl-icon-down-open grey" />
                        </div>
                      )}
                  </div>
                </div>
              )}

            {hasExtract &&
              extract &&
              isEditable && (
                <FormControlWithLabel
                  label=""
                  componentClass="textarea"
                  className="text-area"
                  value={editableExtract}
                  onChange={e => this.editExtract(e.target.value)}
                />
              )}
            {!hasExtract && <div className="selection-body">{selectionText}</div>}
          </div>
          {extracts &&
            extracts.length > 1 && (
              <div className="extracts-numbering">
                {extractIndex + 1}/{extracts.length}
              </div>
            )}
          {hasExtract && (
            <TagsForm canEdit id={extract.id} initialValues={extract.tags || tags} updateTags={this.props.updateTags} />
          )}
          {hasFooter && this.renderFooter()}
        </div>
      </div>
    );
  }
}

export { DumbHarvestingBox };

const mapStateToProps = state => ({
  contentLocale: state.i18n.locale
});

export default compose(
  connect(mapStateToProps),
  graphql(addPostExtractMutation, {
    name: 'addPostExtract'
  }),
  graphql(updateExtractMutation, {
    name: 'updateExtract'
  }),
  graphql(deleteExtractMutation, {
    name: 'deleteExtract'
  }),
  graphql(confirmExtractMutation, {
    name: 'confirmExtract'
  }),
  graphql(updateExtractTagsMutation, {
    name: 'updateTags'
  }),
  manageErrorAndLoading({ displayLoader: true })
)(DumbHarvestingBox);