import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigCorrectNumberOfServersForiSCSI = function (generalValues, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, dcItem) {
  let localDebugOn = false

  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForiSCSI", 7, `[DC=${dcItem}] starting #servers for DC=${dcItem} =${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig}`,0,0,0)
  // Looking for workloads that require dedicated instances, like iscsi workload (iSCSI gateway cannot be collocated with other scale-out roles)
  let localiSCSIworkload = 0
  for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {
    // check if this actual workload is "iscsi" and is using this DC
    if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true && workloadsArrayLocal[workloadItem].reqCapacityNet > 0 && workloadsArrayLocal[workloadItem].useCase == "iscsi") {
      localiSCSIworkload += 1
    }
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForiSCSI", 16, `[DC=${dcItem}] # workloads using iSCSI  in this DC = ${localiSCSIworkload}`,0,0,0)
  let localDCsInUse = 0
  for (let dcCheck = 0; dcCheck < generalValues.numberOfDCsPossible; dcCheck++) {
    // Check whether this DC is used at all and add it to the DCs in use
    if (dcConfigArrayLocal[dcCheck].numberOfWorkloadsInDC > 0) {
      localDCsInUse += 1
    }
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForiSCSI", 24, `[DC=${dcItem}] #DCs in use = ${localDCsInUse}`,0,0,0)
  /// if any of the workloads have iscsi-block, and if the workload is in this DC only
  if (localiSCSIworkload > 0){
    /// ..... then, if (round(scale-roles_without_mons / DCs used for all workloads) - #Mons_in_this_DC) > 0
    if ( (Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances / localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances) > 0) {
      /// .... then, if (#Mons_in_this_DC + round(scale-roles_without_mons / DCs used for all workloads) - DCs used for all workloads + round((#servers_for_cnt_single - min#for_special_roles)/ DCs used for all workloads) + min#for_special_roles) > numberOfServersNeededForReplicaInSameDC
      if ( (dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances / localDCsInUse) - localDCsInUse + Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles) / localDCsInUse) + dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
        /// .... then use numberOfServersNeededBasedOnChassisConfig + round((scale-roles_without_mons / DCs used for all workloads) - numberOfNeededMonInstances/2) + round((#servers_for_cnt_single - min#for_special_roles)/DCs used for all workloads) + min#for_special_roles
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig + Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances / localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances/2) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles)/localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles
      }
      else {
        /// else use numberOfServersNeededForReplicaInSameDC
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
      }
    }
    else {
      /// else, if (numberOfNeededMonInstances + round((#servers_for_cnt_single - min#for_special_roles)/DCs used for all workloads) + min#for_special_roles) > numberOfNeededMonInstances
      if ((dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles)/localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles) > dcConfigArrayLocal[dcItem].numberOfNeededMonInstances ) {
        /// ..... then use numberOfNeededMonInstances + round((#servers_for_cnt_single - min#for_special_roles)/DCs used for all workloads) + min#for_special_roles
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles)/localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles
      }
      else {
        /// else use numberOfServersNeededForReplicaInSameDC
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
      }
    }
  }
  else {
    /// else, if round(scale-roles_without_mons / DCs used for all workloads) - #Mons_in_this_DC) > 0
    if ((Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances / localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances) > 0) {
      /// .... then, if ((numberOfNeededMonInstances + round((round(scale-roles_without_mons / DCs used for all workloads) - numberOfNeededMonInstances)/2) + round(#servers_for_cnt_single/DCs used for all workloads)) > numberOfServersNeededForReplicaInSameDC
    // ??
      if ((dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil((Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances / localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances / localDCsInUse)) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC) {
        /// ... then use ((numberOfNeededMonInstances + round((round(scale-roles_without_mons / DCs used for all workloads) - numberOfNeededMonInstances)/2) + round(#servers_for_cnt_single /DCs used for all workloads))
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil((Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances / localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances / localDCsInUse)
      }
      else {
        /// else use numberOfServersNeededForReplicaInSameDC
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
      }
    }
    else {
      /// else, if (numberOfNeededMonInstances + round(#servers_for_cnt_single / DCs used for all workloads)) > numberOfServersNeededBasedOnChassisConfig
      if ((dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstance / localDCsInUse)) > dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig) {
        /// ... then use (numberOfNeededMonInstances + round(#servers_for_cnt_single / DCs used for all workloads))
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstance / localDCsInUse)
      }
      else {
        /// else use numberOfServersNeededBasedOnChassisConfig
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig
      }
    }
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForiSCSI", 77, `[DC=${dcItem}] #servers as per all roles = ${dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances}`,0,0,0)
  // If we need more servers already because of the media configuration, use this higher value.
  if (dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig > dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances){
    dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForiSCSI", 82, `[DC=${dcItem}] corrected #servers per all roles and media = ${dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances}`,0,0,0)
}

export default dcConfigCorrectNumberOfServersForiSCSI