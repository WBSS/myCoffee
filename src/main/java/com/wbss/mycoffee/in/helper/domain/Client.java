/* 
 * Copyright 2015 W.B.S.S GmbH Zurich.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not 
 * use this file except in compliance with the License. You may obtain a copy 
 * of the License at 
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0 
 *   
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT 
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the 
 * License for the specific language governing permissions and limitations 
 * under the License.
 * 
 */

package com.wbss.mycoffee.in.helper.domain;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * JPA entity for MQ clients
 * 
 * @author Guido Amrein
 *
 */
@Entity
@Table(name = "clients")
public class Client implements Serializable {

    private static final long serialVersionUID = 1L;

    private String client;
    private String type;
    private Integer status;
    private Date timestamp;

    public Client() {
    }

    @Id
    @Column(name = "client", unique = true, nullable = false)
    public String getClient() {
	return this.client;
    }

    public void setClient(String client) {
	this.client = client;
    }

    @Column(name = "type")
    public String getType() {
	return this.type;
    }

    public void setType(String type) {
	this.type = type;
    }
    
    @Column(name = "status")
    public Integer getStatus() {
	return this.status;
    }

    public void setStatus(Integer status) {
	this.status = status;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "timestamp", length = 0)
    public Date getTimestamp() {
	return this.timestamp;
    }

    public void setTimestamp(Date timestamp) {
	this.timestamp = timestamp;
    }

}
