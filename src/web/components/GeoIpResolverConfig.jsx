import React from 'react';
import { Input, Button } from 'react-bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { IfPermitted, Select } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';

import style from '!style!css!components/configurations/ConfigurationStyles.css';

const GeoIpResolverConfig = React.createClass({
  propTypes: {
    config: React.PropTypes.object.isRequired,
    updateConfig: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return this._getStateFromProps(this.props);
  },

  componentWillReceiveProps(newProps) {
    this.setState(this._getStateFromProps(newProps));
  },

  _getStateFromProps(props) {
    return {
      config: {
        enabled: this._getPropConfigValue(props, 'enabled', false),
        db_type: this._getPropConfigValue(props, 'db_type', 'MAXMIND_CITY'),
        db_path: this._getPropConfigValue(props, 'db_path', '/tmp/GeoLite2-City.mmdb'),
      },
    };
  },

  _getPropConfigValue(props, field, defaultValue = null) {
    return props.config ? props.config[field] || defaultValue : defaultValue;
  },

  _updateConfigField(field, value) {
    const update = ObjectUtils.clone(this.state.config);
    update[field] = value;
    this.setState({config: update});
  },

  _onCheckboxClick(field, ref) {
    return () => {
      this._updateConfigField(field, this.refs[ref].getChecked());
    };
  },

  _onSelect(field) {
    return (selection) => {
      this._updateConfigField(field, selection);
    };
  },

  _onUpdate(field) {
    return (e) => {
      this._updateConfigField(field, e.target.value);
    };
  },

  _openModal() {
    this.refs.geoIpConfigModal.open();
  },

  _closeModal() {
    this.refs.geoIpConfigModal.close();
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _saveConfig() {
    this.props.updateConfig(this.state.config).then(() => {
      this._closeModal();
    });
  },

  _availableDatabaseTypes() {
    // TODO: Support country database as well.
    return [
      {value: 'MAXMIND_CITY', label: 'City database'},
    ];
  },

  _activeDatabaseType(type) {
    return this._availableDatabaseTypes().filter((t) => t.value === type)[0].label;
  },

  render() {
    return (
      <div>
        <h3>Geo-Location Processor</h3>

        <p>If enabled, the GeoIP processor plugin scans all fields of every message for IPv4 addresses and puts the
          location information into a field named <code>fieldname_geolocation</code> where "fieldname" is the name
          of the field in which an IP address has been found.</p>

        <dl className={style.deflist}>
          <dt>Enabled:</dt>
          <dd>{this.state.config.enabled === true ? 'yes' : 'no'}</dd>
          <dt>Database type:</dt>
          <dd>{this._activeDatabaseType(this.state.config.db_type)}</dd>
          <dt>Database path:</dt>
          <dd>{this.state.config.db_path}</dd>
        </dl>

        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>Update</Button>
        </IfPermitted>

        <BootstrapModalForm ref="geoIpConfigModal"
                            title="Update Geo-Location Processor Configuration"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonText="Save">
          <fieldset>
            <Input type="checkbox"
                   ref="configEnabled"
                   label="Enable Geo-Location processor"
                   name="enabled"
                   checked={this.state.config.enabled}
                   onChange={this._onCheckboxClick('enabled', 'configEnabled')}/>
            <Input label="Select the MaxMind database type"
                   help="Select the MaxMind database type you want to use to extract geo-location information.">
              <Select placeholder="Select MaxMind database type"
                      options={this._availableDatabaseTypes()}
                      matchProp="value"
                      value={this.state.config.db_type}
                      onValueChange={this._onDbTypeSelect}/>
            </Input>
            <Input type="text"
                   label="Path to the MaxMind database"
                   help={<span>You can download a free version of the database from <a href="https://dev.maxmind.com/geoip/geoip2/geolite2/" target="_blank">MaxMind</a>.</span>}

                   name="db_path"
                   value={this.state.config.db_path}
                   onChange={this._onUpdate('db_path')}/>
          </fieldset>
        </BootstrapModalForm>
      </div>
    );
  },
});

export default GeoIpResolverConfig;
