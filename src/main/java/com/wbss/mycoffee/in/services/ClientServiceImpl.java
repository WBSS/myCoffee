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

package com.wbss.mycoffee.in.services;

import java.util.List;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wbss.mycoffee.in.helper.domain.Client;
import com.wbss.mycoffee.in.helper.repository.ClientRepository;

/**
 * MQ client service implementation
 * 
 * @author Guido Amrein
 *
 */
@Service("clientService")
@Transactional(readOnly = true)
public class ClientServiceImpl implements ClientService {

    final static Logger log = Logger.getLogger(ClientServiceImpl.class);

    @PersistenceContext
    private EntityManager em;

    @Inject
    ClientRepository clientRepo;

    /**
     * Get all MQ machine clients
     * 
     * @return list of machine clients
     */
    @Override
    public List<Client> findAllValid() {

	return clientRepo.findAllValid();
    }

}