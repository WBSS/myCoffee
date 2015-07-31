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

package com.wbss.mycoffee.in.helper.spring;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.support.BeanDefinitionReader;
import org.springframework.beans.factory.xml.XmlBeanDefinitionReader;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigUtils;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.core.io.FileSystemResourceLoader;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.context.MergedContextConfiguration;
import org.springframework.test.context.support.AbstractContextLoader;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.GenericWebApplicationContext;

/**
 * Spring web context loader5
 * 
 * @author Guido Amrein
 *
 */
public class WebContextLoader extends AbstractContextLoader {

    public static final ServletContext SERVLET_CONTEXT = new MockServletContext(
	    "/src/main/webapp", new FileSystemResourceLoader());

    protected BeanDefinitionReader createBeanDefinitionReader(
	    final GenericApplicationContext context) {
	return new XmlBeanDefinitionReader(context);
    }

    @Override
    protected String getResourceSuffix() {
	return "-config.xml";
    }

    @Override
    public ApplicationContext loadContext(
	    MergedContextConfiguration mergedConfig) throws Exception {

	final GenericWebApplicationContext webContext = new GenericWebApplicationContext();
	SERVLET_CONTEXT.setAttribute(
		WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE,
		webContext);
	webContext.setServletContext(SERVLET_CONTEXT);
	createBeanDefinitionReader(webContext).loadBeanDefinitions(
		mergedConfig.getLocations());
	AnnotationConfigUtils.registerAnnotationConfigProcessors(webContext);
	webContext.refresh();
	webContext.registerShutdownHook();
	return webContext;
    }

    @Override
    public ApplicationContext loadContext(String... locations) throws Exception {
	return null;
    }

}
